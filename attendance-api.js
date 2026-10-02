require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 9999;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/su26db";

app.use(express.json());

const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    studentCode: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
  },
  { versionKey: false },
);

const subjectSchema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    status: { type: String, required: true },
  },
  { versionKey: false },
);

const classSchema = new Schema(
  {
    className: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    lecturerName: { type: String, required: true },
    status: { type: String, required: true },
    enrollments: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        status: { type: String, enum: ["enrolled", "dropped"], required: true },
      },
    ],
  },
  { versionKey: false },
);

const attendanceSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["PRESENT", "ABSENT"], required: true },
  },
  { versionKey: false },
);

// A student can have only one attendance record for a class on a given date.
attendanceSchema.index({ studentId: 1, classId: 1, date: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);
const Subject = mongoose.model("Subject", subjectSchema);
const Class = mongoose.model("Class", classSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

function hasValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateIsInvalidOrFuture(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return true;

  return startOfDay(date) > startOfDay(new Date());
}

function error(res, status, message) {
  return res.status(status).json({ error: message });
}

// Question 1 - GET /api/classes/:classId/students?status=enrolled
app.get("/api/classes/:classId/students", async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { status } = req.query;

    if (!hasValidObjectId(classId)) {
      return error(res, 400, `Invalid classId: ${classId}`);
    }

    if (!["enrolled", "dropped"].includes(status)) {
      return error(res, 400, `Invalid status: ${status}`);
    }

    const foundClass = await Class.findById(classId).lean();
    if (!foundClass) {
      return error(res, 404, `Class with id = ${classId} not found`);
    }

    const studentIds = foundClass.enrollments
      .filter((enrollment) => enrollment.status === status)
      .map((enrollment) => enrollment.studentId);

    const students = await Student.find({ _id: { $in: studentIds } })
      .select("studentCode fullName email")
      .lean();

    return res.json(
      students.map(({ _id, studentCode, fullName, email }) => ({
        id: _id,
        studentCode,
        fullName,
        email,
      })),
    );
  } catch (err) {
    return next(err);
  }
});

// Question 2 - GET /api/classes/:classId/attendance-summary
app.get("/api/classes/:classId/attendance-summary", async (req, res, next) => {
  try {
    const { classId } = req.params;
    if (!hasValidObjectId(classId)) {
      return error(res, 400, `Invalid classId: ${classId}`);
    }

    const foundClass = await Class.findById(classId).lean();
    if (!foundClass) {
      return error(res, 404, `Class with id = ${classId} not found`);
    }

    const enrolledIds = foundClass.enrollments
      .filter((enrollment) => enrollment.status === "enrolled")
      .map((enrollment) => enrollment.studentId);

    const [students, attendances] = await Promise.all([
      Student.find({ _id: { $in: enrolledIds } }).select("studentCode fullName").lean(),
      Attendance.find({ classId, studentId: { $in: enrolledIds } }).lean(),
    ]);

    const attendanceByStudent = new Map();
    for (const attendance of attendances) {
      const key = attendance.studentId.toString();
      const summary = attendanceByStudent.get(key) || { totalSessions: 0, present: 0, absent: 0 };
      summary.totalSessions += 1;
      summary.present += attendance.status === "PRESENT" ? 1 : 0;
      summary.absent += attendance.status === "ABSENT" ? 1 : 0;
      attendanceByStudent.set(key, summary);
    }

    return res.json(
      students.map((student) => {
        const summary = attendanceByStudent.get(student._id.toString()) || {
          totalSessions: 0,
          present: 0,
          absent: 0,
        };
        const attendanceRate = summary.totalSessions
          ? Number(((summary.present / summary.totalSessions) * 100).toFixed(1))
          : 0;

        return {
          studentCode: student.studentCode,
          fullName: student.fullName,
          ...summary,
          attendanceRate,
          warning: attendanceRate < 80,
        };
      }),
    );
  } catch (err) {
    return next(err);
  }
});

// Question 3 - GET /api/students/:studentId/attendances
app.get("/api/students/:studentId/attendances", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (!hasValidObjectId(studentId)) {
      return error(res, 400, `Invalid studentId: ${studentId}`);
    }

    const student = await Student.findById(studentId).lean();
    if (!student) {
      return error(res, 404, `Student with id = ${studentId} not found`);
    }

    const history = await Attendance.find({ studentId })
      .populate({
        path: "classId",
        select: "className subjectId",
        populate: { path: "subjectId", model: Subject, select: "name" },
      })
      .sort({ date: -1 })
      .lean();

    return res.json(
      history.map((attendance) => ({
        id: attendance._id,
        className: attendance.classId.className,
        subjectName: attendance.classId.subjectId.name,
        date: attendance.date,
        status: attendance.status,
      })),
    );
  } catch (err) {
    return next(err);
  }
});

// Question 4 - POST /api/classes/:classId/attendances
app.post("/api/classes/:classId/attendances", async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { date, records } = req.body;

    if (!hasValidObjectId(classId)) {
      return error(res, 400, `Invalid classId: ${classId}`);
    }

    const foundClass = await Class.findById(classId).lean();
    if (!foundClass) {
      return error(res, 404, `Class with id = ${classId} not found`);
    }

    if (!date || dateIsInvalidOrFuture(date)) {
      return error(res, 400, "Date cannot be in the future");
    }

    if (!Array.isArray(records) || records.length === 0) {
      return error(res, 400, "Records is required and cannot be empty");
    }

    const enrolledIds = foundClass.enrollments
      .filter((enrollment) => enrollment.status === "enrolled")
      .map((enrollment) => enrollment.studentId.toString());
    const submittedIds = records.map((record) => record.studentId);
    const uniqueSubmittedIds = new Set(submittedIds);

    if (uniqueSubmittedIds.size !== submittedIds.length) {
      return error(res, 400, "Each student may appear only once in records");
    }

    for (const record of records) {
      if (!hasValidObjectId(record.studentId)) {
        return error(res, 400, `Invalid studentId: ${record.studentId}`);
      }
      if (!enrolledIds.includes(record.studentId)) {
        return error(res, 400, `Student ${record.studentId} does not belong to class`);
      }
      if (!["PRESENT", "ABSENT"].includes(record.status)) {
        return error(res, 400, `Invalid status: ${record.status}`);
      }
    }

    for (const studentId of enrolledIds) {
      if (!uniqueSubmittedIds.has(studentId)) {
        const student = await Student.findById(studentId).lean();
        return error(res, 400, `Missing attendance for student ${student.studentCode} (${student.fullName})`);
      }
    }

    const attendanceDate = startOfDay(date);
    let updatedCount = 0;

    for (const record of records) {
      const existing = await Attendance.findOne({
        classId,
        studentId: record.studentId,
        date: attendanceDate,
      });

      if (existing) updatedCount += 1;

      await Attendance.findOneAndUpdate(
        { classId, studentId: record.studentId, date: attendanceDate },
        { status: record.status },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    const present = records.filter((record) => record.status === "PRESENT").length;
    return res.status(201).json({
      message: "Attendance recorded successfully",
      totalRecords: records.length,
      present,
      absent: records.length - present,
      updatedCount,
    });
  } catch (err) {
    return next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Attendance API running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

import { Redirect } from 'expo-router';

export default function CustomerTabsIndex() {
  return <Redirect href={"/(customer)/home" as any} />;
}

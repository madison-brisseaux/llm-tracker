import { getModels } from '@/lib/storage';
import ModelTable from '@/components/ModelTable';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const { models, lastUpdated } = await getModels();
  return <ModelTable models={models} lastUpdated={lastUpdated} />;
}

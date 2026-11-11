import MindmapApp from '../src/components/MindmapApp';

export default function Page() {
  return <MindmapApp liveblocksEnabled={Boolean(process.env.LIVEBLOCKS_SECRET_KEY)} />;
}

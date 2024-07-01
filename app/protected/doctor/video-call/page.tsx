import dynamic from 'next/dynamic';
import Head from 'next/head';

// Use dynamic import to avoid SSR issues
const AgoraVideoWrapper = dynamic(() => import('@/components/agoravideo'), { ssr: false });

export default function VideoCallPage() {
  return (
    <div>
      <Head>
        <title>Video Call</title>
      </Head>
      <main className="p-8">
        <h1 className="text-4xl mb-4">Video Call</h1>
        <AgoraVideoWrapper />
      </main>
    </div>
  );
}
'use client';

import { DataProvider } from '@/lib/DataContext';
import AppShell from '@/components/AppShell';
import Dashboard from '@/components/Dashboard';
import ScriptEditor from '@/components/ScriptEditor';
import VoiceLab from '@/components/VoiceLab';
import ContentPipeline from '@/components/ContentPipeline';
import AudioLibrary from '@/components/AudioLibrary';

export default function Home() {
  return (
    <DataProvider>
      <AppShell>
        <Dashboard page="" />
        <ScriptEditor page="" />
        <VoiceLab page="" />
        <ContentPipeline page="" />
        <AudioLibrary page="" />
      </AppShell>
    </DataProvider>
  );
}

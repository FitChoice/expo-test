import { Stack, Link } from 'expo-router';

import { Container } from '@/components/Container';
import { PoseCamera } from '@/components/Pose';
import Permission from '@/components/Permission';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <Permission> 
            <PoseCamera />
        </Permission>
      </Container>
    </>
  );
}

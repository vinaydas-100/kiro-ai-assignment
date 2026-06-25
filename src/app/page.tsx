import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { fetchPost } from '@/lib/apiClient';
import CounterCard from '@/components/CounterCard';
import PostCard from '@/components/PostCard';

export default async function Home() {
  let post = null;
  let error: string | null = null;

  try {
    post = await fetchPost(1);
  } catch {
    error = 'Failed to load post. Please try again later.';
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Hello World
      </Typography>
      <CounterCard />
      <PostCard post={post} error={error} />
    </Container>
  );
}

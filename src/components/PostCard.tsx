'use client';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import type { Post } from '@/types/post';

interface PostCardProps {
  post: Post | null;
  error: string | null;
}

export default function PostCard({ post, error }: PostCardProps) {
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!post) return null;
  return (
    <Card variant="outlined" sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6">{post.title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{post.body}</Typography>
      </CardContent>
    </Card>
  );
}

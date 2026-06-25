'use client';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import { useCounterStore } from '@/store/counterStore';

export default function CounterCard() {
  const { count, increment, decrement, reset } = useCounterStore();
  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="h5">Counter: {count}</Typography>
      <ButtonGroup sx={{ mt: 1 }}>
        <Button onClick={decrement}>−</Button>
        <Button onClick={reset}>Reset</Button>
        <Button onClick={increment}>+</Button>
      </ButtonGroup>
    </Box>
  );
}

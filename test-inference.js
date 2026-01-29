import { detectTubes } from './src/lib/ai/inference';
import { readFileSync } from 'fs';

async function testInference() {
  try {
    console.log('Starting inference test...');
    
    // Read the test image
    const imagePath = 'D:\\websites\\repositories\\water-sort-solver\\tensor-flow\\dataset\\images\\train\\tube_16_7713623.png';
    const buffer = readFileSync(imagePath);
    const blob = new Blob([buffer], { type: 'image/png' });
    const file = new File([blob], 'tube_16_7713623.png', { type: 'image/png' });
    
    console.log('Image loaded, running detection...');
    const result = await detectTubes(file);
    
    console.log('Detection complete!');
    console.log('Number of tubes detected:', result.boxes.length);
    console.log('Detections:', result.boxes);
    
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

testInference();

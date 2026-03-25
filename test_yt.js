import { extractVideoInfo } from './services/downloaderService.js';

async function test() {
  try {
    console.log('Testing extraction...');
    const result = await extractVideoInfo('https://www.facebook.com/facebook/videos/10153231379946729/');
    console.log('Success:', result.title);
  } catch (err) {
    console.error('Test failed:', err);
  }
}
test();

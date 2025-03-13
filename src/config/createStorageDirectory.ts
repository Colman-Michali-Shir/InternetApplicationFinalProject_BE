import fs from 'fs';
import path from 'path';

export const createStorageDirectory = () => {
  const dirPath = path.join(__dirname, '../../storage');

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log('Directory created:', dirPath);
  } else {
    console.log('Directory already exists:', dirPath);
  }
};

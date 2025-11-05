// NOTE: You most likely do not need to call or run this file
// This is just a preprocessing script to rename airline logo image files (https://github.com/imgmongelli/airlines-logos-dataset)

const fs = require('fs');
const path = require('path');

// Path to the JSON file
const jsonFilePath = './airlines.json';  // Adjust the path to your actual JSON file

// Directory where the images are located
const imageDir = './images/';

// Read the JSON file asynchronously
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the JSON file:', err);
    return;
  }

  // Parse the JSON data
  const parsedData = JSON.parse(data);

  // Process each airline in the data
  parsedData.data.forEach(airline => {
    const iataCode = airline.iata_code;
    const oldImage = airline.logo;

    // Proceed only if the IATA code is available and the logo is not null
    if (!oldImage) {
      console.log(`Skipping airline: ${airline.name} (missing logo)`);
      return;
    }

    if (iataCode) {
      const oldFileName = path.basename(oldImage); // Extract the file name from the path
      const newFileName = `${iataCode}.png`; // Rename it using the IATA code

      const oldPath = path.join(imageDir, oldFileName);
      const newPath = path.join(imageDir, newFileName);

      // Check if the old image file exists and rename it
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error(`Error renaming file: ${oldFileName} -> ${newFileName}`, err);
        } else {
          console.log(`Renamed: ${oldFileName} -> ${newFileName}`);
        }
      });

    } else {
      const oldFileName = path.basename(oldImage); // Extract the file name from the path
      const oldPath = path.join(imageDir, oldFileName);
      fs.unlink(oldPath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log(`File ${oldFileName} deleted successfully.`);
        }
      });
    }
  });

  console.log('Renaming process completed.');
});

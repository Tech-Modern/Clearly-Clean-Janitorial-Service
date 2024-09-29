const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Define the folder where your markdown files are located
const postsDir = path.join(__dirname, '_posts');

// Define the output JSON file
const outputFilePath = path.join(__dirname, 'posts.json');

exports.handler = async (event, context) => {
  try {
    const posts = [];

    // Read the markdown files from the directory
    const files = fs.readdirSync(postsDir);

    files.forEach(file => {
      if (path.extname(file) === '.md') {
        const filePath = path.join(postsDir, file);

        // Read the contents of the markdown file
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent); // Extract frontmatter

        // Push the frontmatter data to the posts array
        posts.push({
          title: data.title || 'No title',
          date: data.date || 'No date',
          file: file  // Add the file name or file path
        });
      }
    });

    // Return the posts as JSON in the response
    return {
      statusCode: 200,
      body: JSON.stringify(posts, null, 2),
    };
  } catch (err) {
    console.error('Error generating posts:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error generating posts' }),
    };
  }
};
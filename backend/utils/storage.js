const fs = require('fs').promises;
const path = require('path');

const usersPath = path.join(__dirname, '../../storage/users.json');
const chatsPath = path.join(__dirname, '../../storage/chats.json');

const readJSON = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeJSON = async (filePath, data) => {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tempPath, filePath);
};

const getUsers = () => readJSON(usersPath);
const saveUsers = (data) => writeJSON(usersPath, data);

const getChats = () => readJSON(chatsPath);
const saveChats = (data) => writeJSON(chatsPath, data);

module.exports = {
  getUsers,
  saveUsers,
  getChats,
  saveChats
};

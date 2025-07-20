const buildAvatarUrl = (req, path) => {
  const defaultAvatar = 'https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg';
  console.log('buildAvatarUrl: Input path:', path);
  if (!path) {
    console.log('buildAvatarUrl: Returning default avatar');
    return defaultAvatar;
  }
  const url = path.startsWith('http') 
    ? path 
    : `${req.protocol}://${req.get('host')}${path}`;
  console.log('buildAvatarUrl: Output URL:', url);
  return url;
};

module.exports = buildAvatarUrl;
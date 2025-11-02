const NodeClam = require('clamscan');

let clamInstance = null;

async function getClam() {
  if (clamInstance) return clamInstance;
  const clamscan = await new NodeClam().init({
    removeInfected: false,
    quarantineInfected: false,
    scanLog: null,
    clamdscan: {
      host: process.env.CLAMAV_HOST || '127.0.0.1',
      port: parseInt(process.env.CLAMAV_PORT || '3310', 10),
      socket: false,
      timeout: 60000,
      localFallback: true,
    },
    clamscan: {
      path: process.env.CLAMSCAN_PATH || null,
    },
  });
  clamInstance = clamscan;
  return clamscan;
}

const antivirusScan = async (req, res, next) => {
  try {
    if (process.env.ENABLE_AV_SCAN !== 'true') return next();
    if (!req.file || !req.file.path) return next();

    const clam = await getClam();
    const { isInfected, viruses } = await clam.isInfected(req.file.path);
    if (isInfected) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file failed antivirus scan',
        details: viruses || []
      });
    }
    next();
  } catch (err) {
    console.error('AV scan error:', err.message);
    // Fail safe: if scanner is unavailable, proceed (can flip to block if desired)
    next();
  }
};

module.exports = { antivirusScan };



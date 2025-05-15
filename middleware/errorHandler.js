module.exports=(err, req, res, next)=>{
  res.status(err.statusCode || 500).json({err: err.message || 'Internal server error'})
}
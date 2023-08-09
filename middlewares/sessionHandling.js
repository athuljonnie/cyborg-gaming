function isLoggedIn(req, res, next) {
  if (req.session.user) {
    console.log('isLoggedIn');
; // Redirect to the home page or another route
  } else {
    next();
  }
}
  function log(req, res, next) {
    if (req.session.user) {
    res.redirect('/')
    } else {
    
      next()
    }
  }
  const checkSession = (req, res, next) => {
    console.log("session");
    if (req.session && req.session.user) {
      if (req.path === '/signup' || req.path === '/login') {
        console.log('resdirect')
        return res.redirect('/');
      }
    }
  
    console.log("session-checked")
    next();
  };
  
   function isLoggedInUser(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.redirect("/");
    }
  }
  
function isLoggedInAdmin(req, res, next) {
    
      if (req.session.admin) {
        console.log("hdhg")
        next();
        console.log("hdhyuhg")

      } else {
        res.redirect('/admin/login');
      }
  }

  module.exports = isLoggedIn, isLoggedInAdmin, isLoggedInUser, checkSession, log
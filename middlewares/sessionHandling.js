function isLoggedIn(req, res, next) {
    if (req.session.user) {
      console.log('fddff');
    } else {
      next();
    }
  }
  
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

  module.exports = isLoggedIn, isLoggedInAdmin, isLoggedInUser
function isLoggedIn(req, res, next) {
  if (req.session.user) {

    res.redirect('/')
  } else {
    next();
  }
}

function foracc(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/')
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
    next();

  } else {
    res.redirect('/admin/login');
  }
}

module.exports = isLoggedIn, isLoggedInAdmin, isLoggedInUser, foracc
module.exports = (req, res) => {
    const userData = req.session.user;
    res.render('a_form',{
        userData
    })
}
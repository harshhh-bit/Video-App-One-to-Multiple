const loadIndex = async(req,res) => {
    res.render('index');
}

const loadMeeting = async (req, res) => {
    res.render('meeting', { meeting_id: req.query.meeting_id, is_host: req.query.is_host });
}

const loadStream = async(req,res) => {
    //if(!req.query.username)
        //res.redirect('/meeting'+'?'+'meeting_id='+req.query.meeting_id+'&'+'is_host='+req.query.is_host);
    //else
        res.render('stream', { meeting_id: req.query.meeting_id, username: req.query.username, is_host: req.query.is_host });
}

module.exports = {
    loadIndex,
    loadMeeting,
    loadStream
}
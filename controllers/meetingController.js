const loadIndex = async(req,res) => {
    res.render('index');
}

const loadMeeting = async (req, res) => {
    if (req.query.meetingID && req.query.meetingID.length === 8 && req.query.isHost) {
        res.render('stream', { meeting_id: req.query.meetingID, username: "Host", is_host: req.query.isHost });
    } else if (req.query.meetingID && req.query.meetingID.length === 8 && !req.query.isHost) {
        res.render('meeting', { meeting_id: req.query.meetingID, is_host: req.query.isHost });
    } else {
        res.redirect('/');
    }
};


const loadStream = async(req,res) => {
    if(req.query.meeting_id && req.query.meeting_id.length == 8 && !req.query.username)
        res.redirect('/meeting?meetingID=' + req.query.meeting_id);
    else if(req.query.meeting_id && req.query.meeting_id.length == 8 && req.query.username)
        res.render('stream', { meeting_id: req.query.meeting_id, username: req.query.username, is_host: req.query.is_host });
    else
        res.redirect('/');
}

module.exports = {
    loadIndex,
    loadMeeting,
    loadStream
}
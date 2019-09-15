const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
const { db } = require('./util/admin');
app.use(cors());

const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream
} = require('./handlers/screams');
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead
} = require('./handlers/users');

const FBAuth = require('./util/FBAuth');

//? =================>>>>>> ROUTES <<<<<<==================
//! Get Screams Route
app.get('/screams', getAllScreams);
//! Create/Post data from firestore
app.post('/scream', FBAuth, postOneScream);
//! VIEW onp post scream
app.get('/scream/:screamId', getScream);
//! LIKE A SCREAM
app.get('/scream/:screamId/like', FBAuth, likeScream);
//!  UNLIKE A SCREAM
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
//! COMMENT ON SCREAM
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
//! DELETE A SCREAM
app.delete('/scream/:screamId', FBAuth, deleteScream);

//! Signup route
app.post('/signup', signup);
//! Login Route
app.post('/login', login);
//! Image Upload Route
app.post('/user/image', FBAuth, uploadImage);
//! Add User details Route
app.post('/user', FBAuth, addUserDetails);
//! get own Authenticated User details Route
app.get('/user', FBAuth, getAuthenticatedUser);
//! GET own User Details
app.get('/user/:handle', getUserDetails);
//! Mark Notifications read
app.post('/notifications', FBAuth, markNotificationsRead);
//? ================^^^^^^^ ROUTES ^^^^^^^^===================

exports.api = functions.region('europe-west1').https.onRequest(app);

exports.createNotificationOnLike = functions
    .region('europe-west1')
    .firestore.document('likes/{id}')
    .onCreate(snapshot => {
        return db
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then(doc => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                ) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'like',
                        read: false,
                        screamId: doc.id
                    });
                }
            })
            .catch(err => console.error(err));
    });

//! Delete Notification on UNLIKE POST
exports.deleteNotificationOnUnlike = functions
    .region('europe-west1')
    .firestore.document('likes/{id}')
    .onDelete(snapshot => {
        return db
            .doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch(err => console.error(err));
    });
//! Create Notification on Comment
exports.createNotificationOnComment = functions
    .region('europe-west1')
    .firestore.document(`/comments/{id}`)
    .onCreate(snapshot => {
        return db
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then(doc => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                ) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'comment',
                        read: false,
                        screamId: doc.id
                    });
                }
            })
            .catch(err => console.error(err));
    });

exports.onUserImageChange = functions
    .region('europe-west1')
    .firestore.document('/users/{userImage}')
    .onUpdate(change => {
        console.log(change.before.data());
        console.log(change.after.data());

        if (change.before.data().imageUrl !== change.after.data().imageUrl) {
            console.log('image has changed');
            const batch = db.batch();
            return db
                .collection('screams')
                .where('userHandle', '==', change.before.data().handle)
                .get()
                .then(data => {
                    data.forEach(doc => {
                        const scream = db.doc(`/screams/${doc.id}`);
                        batch.update(scream, { userImage: change.after.data().imageUrl });
                    });
                    return batch.commit();
                });
        } else return true;
    });

//! Delete all Likes, Comments, and Notification when SCREAM is DELETED
exports.onScreamDelete = functions
    .region('europe-west1')
    .firestore.document('/screams/{screamId}')
    .onDelete((snapshot, context) => {
        const screamId = context.params.screamId;
        const batch = db.batch();
        return db
            .collection('comments')
            .where('screamId', '==', screamId)
            .get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                });
                return db
                    .collection('likes')
                    .where('screamId', '==', screamId)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                });
                return db
                    .collection('notifications')
                    .where('screamId', '==', screamId)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                });
                return batch.commit();
            })
            .catch(err => console.error(err));
    });
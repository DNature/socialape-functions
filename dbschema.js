let db = {
    users: [{
        userId: 'dh233kasdkajsd847',
        email: 'newtwo@gmail.com',
        handle: 'newtwo',
        createdAt: '2019-08-08T12:34:56.260Z',
        bio: 'Hello, my name is newtwo, nice to meet you',
        website: 'https://newtwo.com',
        location: 'Africa'
    }],
    screams: [{
        userHandle: 'user',
        body: 'this is the scream body',
        createdAt: '2019-08-08T12:34:56.260Z',
        likeCount: 5,
        commentCount: 2
    }],
    comments: [{
        userHandle: 'user',
        screamId: 'kasjdadkfhaiu8w929',
        body: 'nice one mate!',
        createdAt: '2019-08-08T12:34:56.260Z'
    }],

    notifications: [{
        recipient: 'user',
        sender: 'john',
        read: 'true | false',
        screamId: 'DLxKptIHYoLUq8EFMyrn',
        type: 'like | comment',
        createdAt: '2019-08-08T12:34:56.260Z'
    }]
};

const userDetails = {
    // Redux DATA
    credentials: {
        userId: 'LKASDJFASKLDJAIWOIWEUQ99092323',
        email: 'user@gmail.com',
        handle: 'user',
        createdAt: '2019-08-08T12:34:56.260Z',
        imageUrl: 'image.kjsdakheiojklda/askdjasd',
        bio: 'hello, my name is classed',
        website: 'https://newtwo.com',
        location: 'londo, UK'
    },
    likes: [{
            userHandle: 'user',
            screamId: 'kjsdakhhu231fdgdff'
        },
        {
            userHandle: 'user',
            screamId: 'jkasdhaweu823817uh'
        }
    ]
};
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport =  require('passport');

//POST MODEL
const Post = require('../../models/Post')

//Profile MODEL
const Profile = require('../../models/Profile')

// VALIDATION
const validatePostInput = require('../../validation/post');


// @route        GET api/posts/test
// @description  Tests posts route
// @access       Public
router.get('/test', (req, res) => res.json({
  msg: "posts Works"
}));

// @route        GET api/posts/
// @description  Fetch all posts
// @access       Public
router.get('/', (req, res) => {
    Post.find().sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostsfound: "No posts found with that id"}));

});

// @route        GET api/posts/:id
// @description  Fetch post by id
// @access       Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({nopostfound: "No post found with that id"}));
});

// @route        POST api/posts/
// @description  Create posts
// @access       Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid}= validatePostInput(req.body);

    // Check VALIDATION
    if(!isValid){
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text : req.body.text,
        name : req.body.name,
        avatar : req.body.avatar,
        user : req.user.id
    });

    newPost.save().then(post => res.json( post));
});

// @route        DELETE api/posts/:id
// @description  DELETE post by id
// @access       PRivate
router.delete('/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            // check for post owner
            if(post.user.toString() !== req.user.id){
                return res.status(401).json({notauthorized: 'User not authorized'});
                };
            //delete
            post.remove().then(() => res.json({success: true}));
        
        })
        .catch(err => res.status(404).json({postnotfound: 'No post found'}));
    })

});

// @route        POST api/posts/like/:id
// @description  like post
// @access       PRivate
router.post('/like/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            console.log(post)
            //USER HAS ALREADY LIKED THIS POST
            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                return res.status(400).json({alreadyliked: 'User already liked this post'});
            }   

            // ADD USER ID TO LIKES ARRAY
            post.likes.unshift({user: req.user.id});
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({postnotfound: 'No post found'}));
    })

});

// @route        DELETE api/posts/unlike/:id
// @description  UNLIKE post
// @access       PRivate
router.delete('/unlike/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            //USER HAS NOT YET LIKED THIS POST
            if(post.likes.filter(like => like.user.toString() === req.user.id).length = 0){
                return res
                .status(400)
                .json({notlikedyet: 'You have not yet liked this post'});
            }   

            // REMOVE USER ID FROM LIKES ARRAY
            const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

            // SPLICE OUT OF THE  ARRAY
            post.likes.splice(removeIndex, 1);

            // SAVE
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({postnotfound: 'No post found'}));
    })

});

// @route        POST api/posts/comment/:id
// @description  add comment to post
// @access       PRivate
router.post('/comment/:id', passport.authenticate('jwt', {session:false}), (req, res) => {
        const {errors, isValid}= validatePostInput(req.body);
        // Check VALIDATION
        if(!isValid){
            return res.status(400).json(errors);
        }

        Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id          
            }
        post.comments.unshift(newComment);

        post.save().then(post => res.json(post))
            
        })
        .catch(err => res.status(404).json({postnotfound: 'No post found'}));
    });

// @route        DELETE api/posts/comment/:id/:comment_id
// @description  remove comment from post
// @access       PRivate
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session:false}), (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
        console.log(post);
        //check the see if cmment exists
        if(post.comments.filter(comm => comm._id.toString() == req.params.comment_id).length == 0) {
            return res.status(404).json({commentnotfound : 'Comment not found'})
        } 
        
        const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));

        
    })
    .catch(err => res.status(404).json({postnotfound: 'No post found'}));
});


module.exports = router;
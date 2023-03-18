const express = require('express');
const fs = require('fs');
const {
    v4: uuidv4
} = require('uuid');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

function readData(callback) {
    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            callback(err);
            return;
        }

        callback(null, JSON.parse(data));
    });
}

function writeData(posts, callback) {
    fs.writeFile('./data.json', JSON.stringify(posts), (err) => {
        if (err) {
            callback(err);
            return;
        }

        callback(null);
    });
}

function findPostById(posts, id) {
    return posts[id - 1]; // subtract 1 from the ID to get the numerical index
  }
function generateTimestamp() {
    return new Date().toISOString();
}

function sendError(res, statusCode, message) {
    res.status(statusCode).json({
        error: message
    });
}

function sendJson(res, statusCode, data) {
    res.status(statusCode).json(data);
}

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    sendError(res, 500, 'Internal server error');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

app.get('/v1/api/posts', (req, res) => {
    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            res.status(404).json({
                error: 'Posts not found'
            });
            return;
        }

        const posts = JSON.parse(data);
        res.json(posts);
    });
});

app.post('/v1/api/posts', (req, res) => {
    const {
        title,
        content
    } = req.body;
console.log(req.body);
    if (!title || !content) {
        res.status(400).json({
            error: 'Title and content are required'
        });
        return;
    }

    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            res.status(404).json({
                error: 'Posts not found'
            });
            return;
        }

        const posts = JSON.parse(data);
        const newPost = {
            id: posts.length+1,
            title,
            content,
            last_updated: new Date().toISOString(),
            originally_published: new Date().toISOString(),
        };
        posts.push(newPost);

        fs.writeFile('./data.json', JSON.stringify(posts), (err) => {
            if (err) {
                res.status(500).json({
                    error: 'Error writing to data store'
                });
                return;
            }

            res.status(201).json(newPost);
        });
    });
});

app.get('/v1/api/posts/:id', (req, res) => {
    const {
        id
    } = req.params;

    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            res.status(404).json({
                error: 'Posts not found'
            });
            return;
        }

        const posts = JSON.parse(data);
        const post = posts.find((p) => p.id === id);

        if (!post) {
            res.status(404).json({
                error: 'Post not found'
            });
            return;
        }

        res.json(post);
    });
});

app.patch('/v1/api/posts/:id', (req, res) => {
    const {
        id
    } = req.params;
    const {
        title,
        content
    } = req.body;

    if (!title && !content) {
        res.status(400).json({
            error: 'Title or content is required'
        });
        return;
    }

    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            res.status(404).json({
                error: 'Posts not found'
            });
            return;
        }

        const posts = JSON.parse(data);
        const post = posts.find((p) => p.id === id);

        if (!post) {
            res.status(404).json({
                error: 'Post not found'
            });
            return;
        }

        if (title) {
            post.title = title;
        }
        if (content) {
            post.content = content;
        }
        post.last_updated = new Date().toISOString();

        fs.writeFile('./data.json', JSON.stringify(posts), (err) => {
            if (err) {
                res.status(500).json({
                    error: 'Error writing to data store'
                });
                return;
            }

            res.json(post);
        });
    });
});

app.delete('/v1/api/posts/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            res.status(404).json({
                error: 'Posts not found'
            });
            return;
        }

        let posts = JSON.parse(data);
        const postIndex = posts.findIndex((p) => p.id === id);

        if (postIndex === -1) {
            res.status(404).json({
                error: 'Post not found'
            });
            return;
        }

        posts.splice(postIndex, 1);

        fs.writeFile('./data.json', JSON.stringify(posts), (err) => {
            if (err) {
                res.status(500).json({
                    error: 'Error writing to data store'
                });
                return;
            }

            res.sendStatus(204);
        });
    });
});
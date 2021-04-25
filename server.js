const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
} = require('graphql');

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
];

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
];

const bookType = new GraphQLObjectType({
    name: 'books',
    description: 'this represents book by an author',
    fields: ()=>({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: authorType,
            resolve: (book)=>{
                return authors.find(author=>author.id === book.authorId)
            }
        },
    })
})

const authorType = new GraphQLObjectType({
    name: 'author',
    description: 'this represents author of a book',
    fields: ()=>({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books:{
            type: new GraphQLList(bookType),
            resolve:(author)=>{
                return books.filter(book=>book.authorId === author.id)
            }
        }
    })
})

const rootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'root query',
    fields: ()=>({
        book: {
            type: bookType,
            description: 'a single book',
            args:{
                id: {type: GraphQLInt}
            },
            resolve: (parent, args)=> books.find(book=> book.id === args.id)
        },
        books: {
            type: new GraphQLList(bookType),
            description: 'list of all books',
            resolve: ()=> books
        },
        author: {
            type: authorType,
            description: 'a single author',
            args:{
                id: {type: GraphQLInt}
            },
            resolve: (parent, args)=> authors.find(author=> author.id === args.id)
        },
        authors: {
            type: new GraphQLList(authorType),
            description: 'list of all authors',
            resolve: ()=> authors
        }
    })
});

const rootMutationType = new GraphQLObjectType({
    name: 'mutation',
    description: 'root mutation',
    fields:()=>({
        addBook:{
            type: bookType,
            description: 'add a book',
            args:{
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args)=>{
                const book = {id: books.length+1, name: args.name, authorId: args.authorId};
                books.push(book);
                return book;
            }
        },
        addAuthor:{
            type: authorType,
            description: 'add an author',
            args:{
                name: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args)=>{
                const author = {id: authors.length+1, name: args.name};
                authors.push(author);
                return author;
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: rootQueryType,
    mutation: rootMutationType
})

const app = express();
app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));

const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=> console.log('Express Graphql running on http://localhost:'+PORT+'/graphql'))

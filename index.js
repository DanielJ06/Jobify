const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const path = require('path')

const sqlite = require('sqlite')
const dbConnection = sqlite.open(path.resolve(__dirname, 'banco.sqlite'), { Promise })

const port = process.env.PORT || 3000

app.set('views', path.join(__dirname, 'views'))

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({ extended: true }))

//Home view

app.get('/', async(req, res) => {
    const db = await dbConnection 
    
    const categoriasDb = await db.all('select * from categorias')

    const vagas = await db.all('select * from vagas');

    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter( vaga => vaga.categoria === cat.id )
        }
    })
    res.render('home', {
        categorias
    })
})

//Role

app.get('/vagas/:id', async(req, res) => {
    console.log(req.params.id)

    const db = await dbConnection

    const vagasDb = await db.get('select * from vagas where id = ' + req.params.id);
    console.log(vagasDb)
    res.render('vagas', {
        vagasDb
    })
})

//Admin routes

//Admin home

app.get('/admin', (req, res) => {
    res.render('admin/home')
})

app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas;')
    res.render('admin/vagas', { vagas })
})

//Admin delete role

app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+req.params.id+'') 
    res.redirect('/admin/vagas')
})

//New role page

app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga', { categorias })
})

app.post ('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection
    const { titulo, desc, categoria } = req.body
    await db.run(`insert into vagas(categoria, titulo, desc) values(${categoria}, '${titulo}', '${desc}')`)
    res.redirect('/admin/vagas')
})

//Edit role

app.get('/admin/vagas/edit/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id = '+req.params.id)
    res.render('admin/editar-vaga', { categorias, vaga })
})

app.post ('/admin/vagas/edit/:id', async(req, res) => {
    const db = await dbConnection
    const { id } = req.params
    const { titulo, desc, categoria } = req.body
    await db.run(`update vagas set categoria = ${categoria}, titulo = '${titulo}', desc = '${desc}' where id = ${id}`)
    res.redirect('/admin/vagas')
})

//Category

app.get('/admin/categorias', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/categorias', { categorias })
})

//New category

app.get('/admin/categorias/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-categoria', { categorias })
})

app.post ('/admin/categorias/nova', async(req, res) => {
    const db = await dbConnection
    const { categoria } = req.body
    await db.run(`insert into categorias(categoria) values('${categoria}')`)
    res.redirect('/admin/categorias')
})

//Delete category

app.get('/admin/categorias/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from categorias where id ='+req.params.id+'') 
    res.redirect('/admin/categorias')
})

//Update categoty 

app.get('/admin/categorias/edit/:id', async(req, res) => {
    const db = await dbConnection
    const categoria = await db.get('select * from categorias where id = '+req.params.id)
    res.render('admin/editar-categoria', { categoria })
})

app.post ('/admin/categorias/edit/:id', async(req, res) => {
    const db = await dbConnection
    const { id } = req.params
    const { categoria } = req.body
    await db.run(`update categorias set categoria = '${categoria}' where id = ${id}`)
    res.redirect('/admin/categorias')
})

//Init no banco

const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, desc TEXT);')
    //const vaga = 'Ui/Ux Designer (Vancouver)'
    //const desc = 'Create web templates'
    //await db.run(`insert into vagas(categoria, titulo, desc) values(2, '${vaga}', '${desc}')`)
}
init()

app.listen(port, err => {
    if(err){ console.log('Não foi possivel escutar na porta 3000') }
    else{ console.log('servidor rodando na porta 3000') }
})
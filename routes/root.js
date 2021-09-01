export default async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    reply.view('web/views/home/index', {text: 'prova'});
  })
}

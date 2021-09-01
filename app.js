import AutoLoad from 'fastify-autoload';
import Multipart from 'fastify-multipart';
import FastifyStatic from 'fastify-static';
import {join} from 'desm';
import twig from 'twig';
import PointOfView from 'point-of-view';

export default async function (fastify, opts){

  fastify.register(Multipart, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 100,     // Max field value size in bytes
      fields: 10,         // Max number of non-file fields
      fileSize: 1000000,  // For multipart forms, the max file size in bytes
      files: 1,           // Max number of file fields
      headerPairs: 2000   // Max number of header key=>value pairs
    }
  });

  fastify.register(FastifyStatic, {
    root: join(import.meta.url, 'web/assets'),
    prefix: '/assets',
  })

  fastify.register(AutoLoad, {
    dir: join(import.meta.url, 'plugins'),
    options: Object.assign({}, opts)
  })
  fastify.register(AutoLoad, {
    dir: join(import.meta.url, 'routes'),
    options: Object.assign({}, opts)
  })

  fastify.register(PointOfView, {
    engine: {
      twig: twig,
      layout: 'template',
      viewExt: 'twig',
      options: {}
    }
  })

}

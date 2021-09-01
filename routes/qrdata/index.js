import { DCC, Rule } from 'dcc-utils';
import got from 'got';

export default async function (fastify, opts) {

    fastify.route({
        method: 'POST',
        url: '/',
        handler: onImageUpload
    })

    fastify.route({
        method: 'POST',
        url: '/text',
        handler: onText
    })

    async function verify(dcc) {
        const TRUST_LIST_URL = 'https://raw.githubusercontent.com/bcsongor/covid-pass-verifier/35336fd3c0ff969b5b4784d7763c64ead6305615/src/data/certificates.json';
        const response = await got(TRUST_LIST_URL);
        const signatures = JSON.parse(response.body);
        let is_verified = false;
        for (let signature of signatures) {
            if (signature.pub) {
                try {
                    const verified = await dcc.checkSignature({
                        x: Buffer.from(signature.pub.x),
                        y: Buffer.from(signature.pub.y),
                        kid: Buffer.from(signature.kid),
                    });
                    if (verified) {
                        is_verified = true;
                        break;
                    }
                } catch {}
            }
        }
        return is_verified
    }

    async function onImageUpload(req, reply) {

        const files = await req.saveRequestFiles()

        const dcc = await DCC.fromImage(
            files[0].filepath
        );

        return await onText({body: {raw: dcc.payload}}, reply)
    }

    async function onText(req, reply) {
        console.log(req.body.raw)
        const dcc = await DCC.fromRaw(req.body.raw);
        const rule = Rule.fromFile(
            './data/de_v_rule.json',
            {
                valueSets : '../../data/valueSets.json',
                validationClock: new Date().toISOString(),
            },
        );
        const result = await rule.evaluateDCC(dcc);

        if (result === false) {
            console.log(rule.getDescription());
            console.log(`This certificate has ${dcc.payload.v[0].dn}/${dcc.payload.v[0].sd}.`);
        }
        return {dcc, verification: await verify(dcc), result}
    }

}

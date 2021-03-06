const STUN_URL = "stun:stun.sipsorcery.com";
        const WEBSOCKET_URL = "ws://127.0.0.1:8081/";

        var pc, ws;

        async function start() 
        {
            pc = new RTCPeerConnection({ iceServers: [{ urls: STUN_URL }] });
            pc.ontrack = evt => document.querySelector('#videoCtl').srcObject = evt.streams[0];
            pc.onicecandidate = evt => evt.candidate && ws.send(JSON.stringify(evt.candidate));

            ws = new WebSocket(document.querySelector('#websockurl').value, []);
            ws.onmessage = async function (evt)
            {
                if (/^[\{"'\s]*candidate/.test(evt.data))
                {
                    pc.addIceCandidate(JSON.parse(evt.data));
                }
                else
                {
                    await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(evt.data)));
                    pc.createAnswer()
                        .then((answer) => pc.setLocalDescription(answer))
                        .then(() => ws.send(JSON.stringify(pc.localDescription)));
                }
            };
        };

        async function closePeer() 
        {
            await pc.close();
            await ws.close();
        };
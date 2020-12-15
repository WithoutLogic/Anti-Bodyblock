module.exports = function antiBodyBlock(mod) {
    let timerInterval = null;
    let partyMembers = [], 
        unk1 = 0, unk2 = 0, unk3 = 0;

    mod.game.initialize("me");
    mod.game.initialize("party");

    const removeUser = (e) => {
        if (!partyMembers.length) { return; }
        let idx = partyMembers.findIndex(x => x.playerId === e.playerId && x.serverId ===  e.serverId);
        if (idx > -1) { partyMembers.splice(idx, 1); }
    };
    
    mod.game.party.on("leave", () => {
        partyMembers = [];
        unk1 = 0, unk2 = 0, unk3 = 0;
    });

    mod.game.party.on('member_kick', removeUser);
    mod.game.party.on('member_leave', removeUser);

    const removeBodyBlock = () => {
        if (!partyMembers.length) { return; }
        if (mod.game.me.inDungeon && mod.game.party.inParty) {
            partyMembers.forEach(mem => {
                if (mem.online) {    
                    if (mem.gameId == 0) { return; }                   
                    mod.send('S_PARTY_INFO', 1, {
                        "leader": mem.gameId,
                        "unk1": unk1,
                        "unk2": unk2,
                        "unk3": unk3,
                        "unk4": 1
                    });
                }
            });
        }
    };

    mod.hook('S_LOGIN', 14, event => {
        partyMembers = [];
        unk1 = 0, unk2 = 0, unk3 = 0;
        timerInterval = mod.setInterval(removeBodyBlock, 5000);
    });
    
    mod.hook('S_PARTY_MEMBER_LIST', 7, event => {
        if (event.raid) { return; }
        let idx = -1, gId = -1n;
        unk1 = event.unk2;
        unk2 = event.unk3;
        unk3 = event.unk4;
        event.members.forEach(mem => {
            idx = partyMembers.findIndex(x => x.playerId === mem.playerId && x.serverId ===  mem.serverId);
            if (idx === -1) {
                gId = mem.gameId;
                if (gId === 0n) {
                    if (mod.game.me.playerId === mem.playerId && mod.game.me.serverId ===  mem.serverId) {
                        gId = mod.game.me.gameId;
                    }
                }
                partyMembers.push({
                    "gameId": gId,
                    "playerId": mem.playerId,
                    "serverId": mem.serverId,
                    "online": mem.online
                });
            }
        });
    });

    mod.hook('S_SPAWN_USER', 17, event => {
        let n = partyMembers.length;
        if (!n) { return; }
        for (let i = 0; i < n; i++) {
            if (partyMembers[i].playerId === event.playerId && partyMembers[i].serverId === event.serverId) {
                partyMembers[i].gameId = event.gameId;
                partyMembers[i].online = true;
            }
        }
    });
    
    mod.hook('S_LOGOUT_PARTY_MEMBER', 1, event => {
        let n = partyMembers.length;
        if (!n) { return; }
        for (let i = 0; i < n; i++) {
            if (partyMembers[i].playerId === event.playerId && partyMembers[i].serverId === event.serverId) {
                partyMembers[i].online = false;
            }
        }
    });
}
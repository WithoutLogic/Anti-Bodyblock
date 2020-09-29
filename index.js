module.exports = function antiBodyBlock(mod) {
	//mod.game.initialize("me");
	//mod.game.initialize("party");
	
	//const { command } = mod.require;
	
	let partyMemberList = Object.create(null);
	let partyMembers = [];
	let timerLenght = 5000;
	let timerInterval = null;
	let enabled = true;
	let myGameId = 0, myPlayerId = 0, myServerId = 0;
	
	const removeBodyBlock = () => {
		if (!enabled) { return; }
		if (!Object.keys(partyMemberList).length) { return; }
		if (!partyMembers.length) { return; }
		if (partyMemberList.raid) { return; }
		for (let i = 0; i < partyMembers.length; i++) {
			if (!partyMembers[i].online) { continue; }
			if (!partyMembers[i].gameId) {
				if (partyMembers[i].playerId === myPlayerId && partyMembers[i].serverId === myServerId) {
					partyMembers[i].gameId = myGameId;
				} else { 
					continue; 
				}
			}
			mod.send('S_PARTY_INFO', 1, {
				"leader": partyMembers[i].gameId,
				"unk1": partyMemberList.unk2,
				"unk2": partyMemberList.unk3,
				"unk3": partyMemberList.unk4,
				"unk4": 1
			});
		}
	};

	const removeUser = (event) => {
		if (!partyMembers.length) { return; }
		for (let i = 0; i < partyMembers.length; i++) {
			if (partyMembers[i].serverId === event.serverId && partyMembers[i].playerId === event.playerId) {
				partyMembers.splice(i, 1);
			}
		}
	};

	mod.command.add('bb', () => {
		enabled = !enabled;
		command.message(`Anti-bodyblock is ${(enabled) ? "enabled." : "disabled."}`);
	});

	/*
	mod.game.on("leave_game", () => {
		//mod.clearInterval(timerInterval);
	});
	mod.game.party.on('leave', () => {
		partyMemberList = {};
		partyMembers = [];
	})
	*/
	
	mod.hook('S_LOGIN', 14, event => {
		myGameId = event.gameId;
		myPlayerId = event.playerId;
		myServerId = event.serverId;
		timerInterval = mod.setInterval(removeBodyBlock, timerLenght);
	});

	mod.hook('S_SPAWN_USER', 15, event => {
		if (!Object.keys(partyMemberList).length) { return; }
		for (let i = 0; i < partyMembers.length; i++) {
			if (partyMembers[i].playerId === event.playerId && partyMembers[i].serverId === event.serverId) {
				partyMembers[i].gameId = event.gameId;
				partyMembers[i].online = true;
			}
		}
	});

	mod.hook('S_LEAVE_PARTY_MEMBER', 2, removeUser);
	mod.hook('S_BAN_PARTY_MEMBER', 1, removeUser);
	mod.hook('S_LOGOUT_PARTY_MEMBER', 1, event => {
		if (!partyMembers.length) { return; }
		for (let i = 0; i < partyMembers.length; i++) {
			if (partyMembers[i].playerId === event.playerId && partyMembers[i].serverId === event.serverId) {
				partyMembers[i].online = false;
			}
		}
	});

	mod.hook('S_LEAVE_PARTY', 'event', () => { //'raw'
		partyMemberList = {};
		partyMembers = [];
	});
		
	mod.hook('S_PARTY_MEMBER_LIST', 7, event => {
		Object.assign(partyMemberList, event);
		let n = Object.keys(partyMemberList.members).length;
		for (let i = 0; i < n; i++) {
			if (!partyMembers.length) {
				partyMembers.push({
					"gameId": partyMemberList.members[i].gameId,
					"playerId": partyMemberList.members[i].playerId,
					"serverId": partyMemberList.members[i].serverId,
					"online": partyMemberList.members[i].online
				});
			} else {
				let idx = partyMembers.findIndex(x => x.playerId === partyMemberList.members[i].playerId && x.serverId === partyMemberList.members[i].serverId);
				if (idx > -1) {
					continue;
				} else {
					partyMembers.push({
						"gameId": partyMemberList.members[i].gameId,
						"playerId": partyMemberList.members[i].playerId,
						"serverId": partyMemberList.members[i].serverId,
						"online": partyMemberList.members[i].online
					});
				}
			}
		}
	});
	
	/*
	this.destructor = () => {
		//
	};
	*/
};
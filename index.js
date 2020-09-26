module.exports.NetworkMod = function antiBodyBlock(mod) {
	let partyMemberList = Object.create(null);
	let partyMembers = [];
	let interval = null;
	let enabled = true;

	const removeBodyBlock = () => {
		if (!Object.keys(partyMemberList).length) { return; }
		if (!partyMembers.length) { return; }
		if (!enabled) { return; }
		for (let i = 0; i < partyMembers.length; i++) {
			if (!partyMembers[i].online) { continue; }
			if (!partyMembers[i].gameId) { continue; }
			mod.toClient('S_PARTY_INFO', 1, {
				"leader": partyMembers[i].gameId,
				"unk1": partyMemberList.unk2,
				"unk2": partyMemberList.unk3,
				"unk3": partyMemberList.unk4,
				"unk4": 1
			});
		}
	};

	const hasMember = (sId, pId) => { return partyMembers.findIndex(x => x.serverId === sId && x.playerId === pId); }

	const removeUser = (event) => {
		if (!partyMembers.length) { return; }
		let idx = hasMember(event.serverId, event.playerId);
		if (idx > -1) { partyMembers.splice(idx, 1); }
	};

	mod.command.add('bb', () => {
		enabled = !enabled;
		mod.command.message(`Anti-bodyblock is ${(enabled) ? "enabled." : "disabled."}`);
	});

	mod.hook('S_LOGIN', 14, event => {
		interval = mod.setInterval(removeBodyBlock, 5000);
	});

	mod.hook('S_SPAWN_USER', 15, event => {
		if (!Object.keys(partyMemberList).length) {	return; }
		let idx = hasMember(event.serverId, event.playerId);
		if (idx > -1) {
			partyMembers[idx].gameId = event.gameId;
			partyMembers[idx].online = true;
		}
	});

	mod.hook('S_LEAVE_PARTY_MEMBER', 2, removeUser);
	mod.hook('S_BAN_PARTY_MEMBER', 1, removeUser);
	mod.hook('S_LOGOUT_PARTY_MEMBER', 1, event => {
		if (!partyMembers.length) { return; }
		let idx = hasMember(event.serverId, event.playerId);
		if (idx > -1) { partyMembers[idx].online = false; }
	});

	mod.hook('S_LEAVE_PARTY', 'event', () => {
		partyMemberList = {};
		partyMembers = [];
	});

	mod.hook('S_PARTY_MEMBER_LIST', 7, event => {
		if (event.raid) { return; }
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
				let idx = hasMember(partyMemberList.members[i].serverId, partyMemberList.members[i].playerId);
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
};
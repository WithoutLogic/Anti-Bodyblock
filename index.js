module.exports.NetworkMod = function antiBodyBlock(mod) {
	let partyMemberList = Object.create(null);
	let partyMembers = [];
	let interval = null;
	let enabled = true;

	const removeBodyBlock = () => {
		if (!Object.keys(partyMemberList).length) return;
		if (!partyMembers.length) return;
		for (let i = 0; i < partyMembers.length; i++) {
			if (!partyMembers[i].online) {
				continue;
			}
			if (!partyMembers[i].gameId) {
				continue;
			}
			mod.toClient('S_PARTY_INFO', 1, {
				"leader": partyMembers[i].gameId,
				"unk1": partyMemberList.unk2,
				"unk2": partyMemberList.unk3,
				"unk3": partyMemberList.unk4,
				"unk4": 1
			});
		}
	};

	const removeUser = (event) => {
		if (!partyMembers.length) return;
		for (let i = 0; i < partyMembers.length; i++) {
			if (partyMembers[i].serverId === event.serverId && partyMembers[i].playerId === event.playerId) {
				partyMembers.splice(i, 1);
			}
		}
	};

	mod.command.add('bb', () => {
		enabled = !enabled;
		if (!enabled) {
			if (interval) mod.clearInterval(interval); 
		} else {
			if (!interval) interval = mod.setInterval(removeBodyBlock, 5000); 
		}
		mod.command.message(`Anti-bodyblock is ${(enabled) ? "enabled." : "disabled."}`);
	});

	mod.hook('S_LOGIN', 14, event => {
		if (interval) mod.clearInterval(interval);
		interval = mod.setInterval(removeBodyBlock, 5000);
	});

	mod.hook('S_SPAWN_USER', 15, event => {
		if (!Object.keys(partyMemberList).length) {
			return; 
		}
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
		if (!partyMembers.length) return;
		for (let i = 0; i < partyMembers.length; i++) {
			if (partyMembers[i].playerId === event.playerId && partyMembers[i].serverId === event.serverId) {
				partyMembers[i].online = false;
			}
		}
	});

	mod.hook('S_LEAVE_PARTY', 'event', () => {
		if (interval) mod.clearInterval(interval);
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
		if (!enabled) { 
			if (interval) mod.clearInterval(interval);
		} else {
			if (!interval) interval = mod.setInterval(removeBodyBlock, 5000);
		}
	});
};
import { db } from '@firebase/client';
import { addDoc, collection, doc, type DocumentReference, getDoc, updateDoc } from 'firebase/firestore';

import type { User } from '../interfaces/User';

interface Team {
	name: string;
	owner: string;
	members: string[];
}

/**
 * Provides functions for managing teams.
 * @returns An object containing functions for managing teams.
 */
const useTeamManagement = (): {
	/**
	 * Retrieves the team reference associated with the given user ID.
	 * @param userId - The unique identifier of a user.
	 * @returns A Promise that resolves to the team reference associated with the given user ID, or null if the user is not in a team.
	 */
	getTeamByUserId: (userId: string) => Promise<DocumentReference | null>;
	/**
	 * Creates a new team with the given name and the user as the owner.
	 * @param userId - The unique identifier of a user.
	 * @param teamName - The name of the team.
	 * @returns A Promise that resolves to the team reference of the newly created team.
	 */
	createTeam: (userId: string, teamName: string) => Promise<DocumentReference>;
	/**
	 * Adds a member with the given ID to the team with the given ID.
	 * @param teamId - The unique identifier of a team.
	 * @param memberId - The unique identifier of a member.
	 * @returns A Promise that resolves when the member is successfully added to the team.
	 */
	addMemberToTeam: (teamId: string, memberId: string) => Promise<void>;
	/**
	 * Checks if the given team name is valid.
	 * @param name - The team name to validate.
	 * @returns True if the given team name is valid, false otherwise.
	 */
	validateTeamName: (name: string) => boolean;
	/**
	 * Checks if the given member ID exists in the database.
	 * @param memberId - The unique identifier of a member.
	 * @returns A Promise that resolves to true if the given member ID exists in the database, false otherwise.
	 */
	validateMemberId: (memberId: string) => Promise<boolean>;
	/**
	 * Checks if the member with the given ID is already in the team with the given ID.
	 * @param teamId - The unique identifier of a team.
	 * @param memberId - The unique identifier of a member.
	 * @returns A Promise that resolves to true if the member with the given ID is already in the team with the given ID, false otherwise.
	 */
	isMemberAlreadyInTeam: (teamId: string, memberId: string) => Promise<boolean>;
} => {
	const getTeamByUserId = async (userId: string): Promise<DocumentReference | null> => {
		const userRef = doc(db, 'users', userId);
		const userSnap = await getDoc(userRef);
		const userData = userSnap.data() as User;
		if (userSnap.exists() && userData.team != null) {
			return userData.team;
		}
		return null;
	};

	const createTeam = async (userId: string, teamName: string): Promise<DocumentReference> => {
		const teamRef = await addDoc(collection(db, 'teams'), {
			name: teamName,
			owner: userId,
			members: [userId],
		});
		await updateDoc(doc(db, 'users', userId), {
			team: teamRef,
		});
		return teamRef;
	};

	const addMemberToTeam = async (teamId: string, memberId: string): Promise<void> => {
		const teamRef = doc(db, 'teams', teamId);
		const teamSnap = await getDoc(teamRef);
		if (teamSnap.exists()) {
			const teamData = teamSnap.data() as Team;
			const members = teamData.members ?? [];
			if (!members.includes(memberId)) {
				await updateDoc(teamRef, {
					members: [...members, memberId],
				});
			}
		}
	};

	const validateTeamName = (name: string): boolean => {
		const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{5,}$/;
		return regex.test(name);
	};

	const validateMemberId = async (memberId: string): Promise<boolean> => {
		const userRef = doc(db, 'users', memberId);
		const userSnap = await getDoc(userRef);
		return userSnap.exists();
	};

	const isMemberAlreadyInTeam = async (teamId: string, memberId: string): Promise<boolean> => {
		const teamRef = doc(db, 'teams', teamId);
		const teamSnap = await getDoc(teamRef);

		if (!teamSnap.exists()) {
			throw new Error('Equipo no encontrado.');
		}

		const teamData = teamSnap.data() as Team;
		return teamData.members.includes(memberId);
	};

	return {
		getTeamByUserId,
		createTeam,
		addMemberToTeam,
		validateTeamName,
		validateMemberId,
		isMemberAlreadyInTeam,
	};
};

export default useTeamManagement;

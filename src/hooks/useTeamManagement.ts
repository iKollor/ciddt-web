import { db } from '@firebase/client';
import { addDoc, collection, deleteDoc, doc, type DocumentReference, getDoc, updateDoc } from 'firebase/firestore';

import type { User } from '../interfaces/User';
import { deleteProfilePicture, type pseudoUser } from './useEditProfileManagement';

export interface Team {
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
	 * Retrieves the team reference associated with a given user ID.
	 * @param userId - The unique identifier of a user.
	 * @returns A promise that resolves to the team reference associated with the given user ID, or null if not found.
	 */
	getTeamByUserId: (userId: string) => Promise<DocumentReference | null>;

	/**
	 * Creates a new team with the specified name.
	 * @param userId - The unique identifier of a user.
	 * @param teamName - The name of the team to be created.
	 * @returns A promise that resolves to the reference of the newly created team.
	 */
	createTeam: (userId: string, teamName: string) => Promise<DocumentReference>;

	/**
	 * Adds a member to a team by updating the team's member list.
	 * @param teamId - The unique identifier of a team.
	 * @param memberId - The unique identifier of a team member.
	 * @returns A promise that resolves when the member is successfully added to the team.
	 */
	addMemberToTeam: (teamId: string, memberId: string) => Promise<void>;

	/**
	 * Checks if a team name is valid by performing a simple validation.
	 * @param name - The name to be validated.
	 * @returns A boolean indicating whether the team name is valid or not.
	 */
	validateTeamName: (name: string) => boolean;

	/**
	 * Checks if a member ID is valid by querying the database.
	 * @param memberId - The unique identifier of a team member.
	 * @returns A promise that resolves to a boolean indicating whether the member ID is valid or not.
	 */
	validateMemberId: (memberId: string) => Promise<boolean>;

	/**
	 * Checks if a member is already part of a team by querying the database.
	 * @param teamId - The unique identifier of a team.
	 * @param memberId - The unique identifier of a team member.
	 * @returns A promise that resolves to a boolean indicating whether the member is already in the team or not.
	 */
	isMemberAlreadyInTeam: (teamId: string, memberId: string) => Promise<boolean>;

	/**
	 * Checks if a user is the owner of a team by comparing their user ID with the team's owner ID.
	 * @param userId - The unique identifier of a user.
	 * @param teamId - The unique identifier of a team.
	 * @returns A promise that resolves to a boolean indicating whether the user is the owner of the team or not.
	 */
	isUserTeamOwner: (userId: string, teamId: string) => Promise<boolean>;

	/**
	 * Retrieves the profile data of all members in a team.
	 * @param teamId - The unique identifier of a team.
	 * @returns A promise that resolves to an array of User objects containing the profile data of all members in the team.
	 */
	getProfilesData: (teamId: string) => Promise<pseudoUser[]>;

	/**
	 * Removes a member from a team by updating the team's member list.
	 * @param teamId - The unique identifier of a team.
	 * @param memberId - The unique identifier of a team member.
	 * @returns A promise that resolves when the member is successfully removed from the team.
	 */
	removeMemberFromTeam: (teamId: string, memberId: string) => Promise<void>;

	/**
	 * Retrieves the information of a team by its ID.
	 * @param teamId - The unique identifier of a team.
	 * @returns A promise that resolves to the Team object containing the information of the team.
	 */
	getTeamInfoById: (teamId: string) => Promise<Team>;

	/**
	 * Updates the name of a team.
	 * @param teamId - The unique identifier of a team.
	 * @param newName - The new name for the team.
	 * @returns A promise that resolves when the team name is successfully updated.
	 */
	editTeamName: (teamId: string, newName: string) => Promise<void>;
} => {
	const getTeamByUserId = async (userId: string): Promise<DocumentReference | null> => {
		try {
			const userRef = doc(db, 'users', userId);
			const userSnap = await getDoc(userRef);
			const userData = userSnap.data() as User;
			if (userSnap.exists() && userData.team != null) {
				return userData.team;
			}
			return null;
		} catch (error) {
			console.error('Error al obtener el equipo por ID de usuario:', error);
			return null;
		}
	};

	const getTeamInfoById = async (teamId: string): Promise<Team> => {
		const teamRef = doc(db, 'teams', teamId);
		const teamSnap = await getDoc(teamRef);
		if (!teamSnap.exists()) {
			throw new Error('Equipo no encontrado.');
		}
		return teamSnap.data() as Team;
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

	const isUserTeamOwner = async (userId: string, teamId: string): Promise<boolean> => {
		const teamRef = doc(db, 'teams', teamId);
		const teamSnap = await getDoc(teamRef);

		if (!teamSnap.exists()) {
			throw new Error('Equipo no encontrado.');
		}

		const teamData = teamSnap.data() as Team;
		return teamData.owner === userId;
	};

	const getProfilesData = async (teamId: string): Promise<pseudoUser[]> => {
		const teamRef = doc(db, 'teams', teamId);
		const teamSnap = await getDoc(teamRef);

		if (!teamSnap.exists()) {
			throw new Error('Equipo no encontrado.');
		}

		const teamData = teamSnap.data() as Team;
		const members = teamData.members ?? [];
		const profiles: pseudoUser[] = [];

		for (const memberId of members) {
			const userRef = doc(db, 'users', memberId);
			const userSnap = await getDoc(userRef);
			if (userSnap.exists()) {
				const userData = userSnap.data() as pseudoUser;
				profiles.push(userData);
			}
		}
		return profiles;
	};

	const removeMemberFromTeam = async (teamId: string, memberId: string): Promise<void> => {
		const teamRef = doc(db, 'teams', teamId);
		const teamSnap = await getDoc(teamRef);

		if (!teamSnap.exists()) {
			throw new Error('Equipo no encontrado.');
		}

		const teamData = teamSnap.data() as Team;
		const members = teamData.members ?? [];
		const updatedMembers = members.filter((member) => member !== memberId);
		await updateDoc(teamRef, {
			members: updatedMembers,
		});
		if (memberId.startsWith('pseudo')) {
			const userRef = doc(db, 'users', memberId);
			await deleteDoc(userRef);
		}
		await deleteProfilePicture(memberId);
	};

	const editTeamName = async (teamId: string, newName: string): Promise<void> => {
		const teamRef = doc(db, 'teams', teamId);
		await updateDoc(teamRef, {
			name: newName,
		});
	};

	return {
		getTeamByUserId,
		createTeam,
		addMemberToTeam,
		validateTeamName,
		validateMemberId,
		isMemberAlreadyInTeam,
		isUserTeamOwner,
		getProfilesData,
		removeMemberFromTeam,
		getTeamInfoById,
		editTeamName,
	};
};

export default useTeamManagement;

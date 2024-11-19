/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { db } from '@firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useEffect, useRef, useState } from 'react';
import type { Post } from 'src/interfaces/Post';
// eslint-disable-next-line import/no-named-as-default
import styled from 'styled-components';

import PostCard from './PostCard';

interface HorizontalLoopConfig {
	speed?: number;
	snap?: number | boolean;
	paddingRight?: string;
	paused?: boolean;
	draggable?: boolean;
	reversed?: boolean;
}

const teamId = import.meta.env.PUBLIC_TEAM_ID;

export default function PostCarrousel() {
	const bottomCarousel = useRef<HTMLDivElement>(null);
	const loop = useRef<gsap.core.Timeline | null>(null);

	const [focusedItem, setFocusedItem] = useState<number | null>(null);
	const [posts, setPosts] = useState<Post[] | null>(null);

	const renderCard = (post: Post, index: number) => {
		const isFocused = index === focusedItem;
		return (
			<CarouselItem key={index} className={`box ${isFocused ? 'isFocused' : ''}`}>
				<motion.div
					className={`w-full h-full bg-black flex items-center justify-center text-white rounded-xl ml-4 overflow-hidden ${
						isFocused ? 'border-4 border-red ' : ''
					}`}
					whileHover={{ scale: 1.1 }}
					onClick={() => {
						// toggle focused item
						setFocusedItem(focusedItem === index ? null : index);
					}}
					transition={{
						type: 'spring',
						damping: 10,
						mass: 0.75,
						stiffness: 300,
					}}
				>
					<PostCard post={post} isFocused={isFocused}></PostCard>
				</motion.div>
			</CarouselItem>
		);
	};

	// Note: `horizontalLoop` function remains the same, ensure you type any parameters and variables appropriately.
	const horizontalLoop = (items: HTMLElement[], config?: HorizontalLoopConfig): GSAPTimeline => {
		items = gsap.utils.toArray(items);
		config = config ?? {};
		if (config.snap == null) config.snap = false;
		const tl = gsap.timeline({
			repeat: -1,
			paused: config.paused ?? false,
			defaults: { ease: 'none' },
			onReverseComplete: () => {
				tl.totalTime(tl.rawTime() + tl.duration() * 100);
			},
		});
		const length = items.length;
		const startX = items[0].offsetLeft;
		const times: number[] = [];
		const widths: number[] = [];
		const xPercents: number[] = [];
		let curIndex = 0;
		const pixelsPerSecond = (config.speed ?? 1) * 100;
		const snap = config.snap === false ? (v: number) => v : gsap.utils.snap(1);

		const populateWidths = (): void => {
			items.forEach((el, i) => {
				widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px') as string);
				xPercents[i] = snap(
					(parseFloat(gsap.getProperty(el, 'x', 'px') as string) / widths[i]) * 100 +
						(gsap.getProperty(el, 'xPercent') as number),
				);
			});
		};

		const getTotalWidth = (): number => {
			return (
				items[length - 1].offsetLeft +
				(xPercents[length - 1] / 100) * widths[length - 1] -
				startX +
				items[length - 1].offsetWidth * (gsap.getProperty(items[length - 1], 'scaleX') as number) +
				parseFloat(config.paddingRight ?? '0')
			);
		};

		let totalWidth: number;
		let curX: number;
		let distanceToStart: number;
		let distanceToLoop: number;
		let item: HTMLElement;
		let i: number;

		populateWidths();

		gsap.set(items, {
			xPercent: (i: number) => xPercents[i],
		});

		gsap.set(items, { x: 0 });

		totalWidth = getTotalWidth();

		for (i = 0; i < length; i++) {
			item = items[i];
			curX = (xPercents[i] / 100) * widths[i];
			distanceToStart = item.offsetLeft + curX - startX;
			distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, 'scaleX') as number);

			tl.to(
				item,
				{
					xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
					duration: distanceToLoop / pixelsPerSecond,
				},
				0,
			)
				.fromTo(
					item,
					{
						xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100),
					},
					{
						xPercent: xPercents[i],
						duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
						immediateRender: false,
					},
					distanceToLoop / pixelsPerSecond,
				)
				.add(`label${i}`, distanceToStart / pixelsPerSecond);

			times[i] = distanceToStart / pixelsPerSecond;
		}

		const toIndex = (index: number, vars: gsap.TweenVars = {}): GSAPTween => {
			Math.abs(index - curIndex) > length / 2 && (index += index > curIndex ? -length : length);
			const newIndex = gsap.utils.wrap(0, length, index);
			let time = times[newIndex];

			if (time > tl.time() !== index > curIndex) {
				vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
				time += tl.duration() * (index > curIndex ? 1 : -1);
			}

			curIndex = newIndex;
			vars.overwrite = true;
			return tl.tweenTo(time, vars);
		};

		tl.next = (vars: gsap.TweenVars = {}) => toIndex(curIndex + 1, vars);
		tl.previous = (vars: gsap.TweenVars = {}) => toIndex(curIndex - 1, vars);
		tl.current = () => curIndex;
		tl.toIndex = (index: number, vars: gsap.TweenVars = {}) => toIndex(index, vars);
		tl.updateIndex = () => (curIndex = Math.round(tl.progress() * (items.length - 1)));
		tl.times = times;
		tl.progress(1, true).progress(0, true);

		if (config.reversed ?? false) {
			if (tl.vars.onReverseComplete != null) tl.vars.onReverseComplete();
			tl.reverse();
		}
		if ((config.draggable ?? false) && typeof Draggable === 'function') {
			const proxy = document.createElement('div');
			const wrap = gsap.utils.wrap(0, 1);
			let ratio: number;
			let startProgress: number | undefined;
			let dragSnap: number;
			let roundFactor: number;
			const align = () => {
				if (loop.current != null && startProgress !== undefined) {
					const newProgress = wrap(startProgress + (draggable.startX - draggable.x) * ratio);
					loop.current.progress(newProgress);
				}
			};
			const syncIndex = () => tl.updateIndex();
			typeof InertiaPlugin === 'undefined' &&
				// eslint-disable-next-line prettier/prettier
				console.warn('InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club');
			const draggable: globalThis.Draggable = Draggable.create(proxy, {
				trigger: '.wrapper',
				type: 'x',
				onPress() {
					startProgress = loop.current?.progress();
					loop.current?.progress(0);
					populateWidths();
					totalWidth = getTotalWidth();
					ratio = 1 / totalWidth;
					dragSnap = totalWidth / items.length;
					roundFactor = Math.pow(10, ((dragSnap + '').split('.')[1] ?? '').length);
					loop.current?.progress(startProgress ?? 0);
				},
				onDrag: align,
				onThrowUpdate: align,
				inertia: false,
				snap: (value) => {
					const n = Math.round(value / dragSnap) * dragSnap * roundFactor;
					return (n - (n % 1)) / roundFactor;
				},
				onRelease: syncIndex,
				onThrowComplete: () => {
					gsap.set(proxy, { x: 0 });
					syncIndex();
				},
			})[0];
		}

		return tl;
	};

	useEffect(() => {
		if (teamId != null && posts == null) {
			fetchPosts(teamId)
				.then((postsData) => {
					setPosts(postsData);
				})
				.catch((error) => {
					console.error(error);
				});
		}

		if (posts != null) {
			gsap.registerPlugin(Draggable);
			let boxes: HTMLElement[] = [];
			if (bottomCarousel.current != null) {
				const bottom = gsap.utils.selector(bottomCarousel);
				boxes = gsap.utils.toArray(bottom('.box'));

				gsap.set(boxes, {
					x: (i: number) => i * boxes[0].offsetWidth,
				});

				loop.current = horizontalLoop(boxes, {
					paused: false,
					draggable: true,
				});
			}
			return () => {
				loop.current?.kill();
				gsap.set(boxes, { clearProps: 'all' });
			};
		}
	}, [posts]);

	const fetchFacebookPosts = async (teamId: string): Promise<Post[]> => {
		// get posts from firebase
		const postsRef = collection(db, 'posts', teamId, 'facebook');
		const postsSnap = await getDocs(postsRef);
		const postsData: Post[] = [];
		postsSnap.forEach((doc: any) => {
			postsData.push(doc.data() as Post);
		});
		return postsData;
	};

	const fetchInstagramPosts = async (teamId: string): Promise<Post[]> => {
		// get posts from firebase
		const postsRef = collection(db, 'posts', teamId, 'instagram');
		const postsSnap = await getDocs(postsRef);
		const postsData: Post[] = [];
		postsSnap.forEach((doc: any) => {
			postsData.push(doc.data() as Post);
		});
		return postsData;
	};

	const fetchPosts = async (teamId: string): Promise<Post[] | null> => {
		// get posts from firebase
		const facebookPosts = await fetchFacebookPosts(teamId);
		const instagramPosts = await fetchInstagramPosts(teamId);

		// filtrar posts de facebook e instagram por fecha y por cantidad de likes y devolver solo los primeros 10 y que el mediaType sea video
		const postsData = instagramPosts.concat(facebookPosts);
		postsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
		postsData.sort((a, b) => b.likesCount - a.likesCount);
		postsData.splice(10);
		if (postsData.length > 0) {
			return postsData;
		} else {
			return null;
		}
	};

	return (
		<div className="App">
			<CarouselContainer
				ref={bottomCarousel}
				onMouseEnter={() => {
					loop.current?.pause();
				}}
				onMouseLeave={() => {
					if (focusedItem === null) loop.current?.play();
				}}
				onClick={() => {
					loop.current?.pause();
				}}
				className="boxes wrapper max-lg:!h-[300px]"
			>
				{posts == null ? (
					<div className="w-[80%] mx-auto h-full flex justify-center items-center text-center max-lg:flex-col">
						<h1 className="text-2xl font-bold">Aún no hay nada aquí, todavía</h1>
						<h1 className="ml-2 text-2xl font-bold animate-bounce">😉</h1>
					</div>
				) : (
					posts.map((post, index) => {
						return renderCard(post, index);
					})
				)}
			</CarouselContainer>
		</div>
	);
}

const CarouselContainer = styled.div`
	width: 100%;
	margin-top: 100px;
	height: 500px;
	margin: auto;
	overflowx: hidden;
	position: relative;
`;

const CarouselItem = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	aspect-ratio: 2/3;
	height: 100%;
`;

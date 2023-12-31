import { createRouter, createWebHistory } from 'vue-router'

import HomeView from "../views/HomeView.vue";
import GameView from "../views/GameView.vue";
import AboutView from "../views/AboutView.vue";

const routes = [
	{
		path: '/',
		component: HomeView,
	},
	{
		path: '/game',
		component: GameView,
	}, 
	{
		path: '/about',
		component: AboutView,
	}
	// {
	// 	path: '/about',
	// 	name: 'about',
	// 	// route level code-splitting
	// 	// this generates a separate chunk (about.[hash].js) for this route
	// 	// which is lazy-loaded when the route is visited.
	// 	component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
	// }
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
});

export default router

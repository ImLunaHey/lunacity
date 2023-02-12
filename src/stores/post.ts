import { create } from 'zustand';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { Post } from '@prisma/client';

type State = {
    posts: Post[];
    addPost: (post: Post) => void;
    addPosts: (posts: Post[]) => void;
}

export const usePostStore = create<State>(set => ({
    posts: [],
    addPost(post) {
        set(state => ({
            ...state,
            posts: [...state.posts, post]
        }));
    },
    addPosts(posts) {
        set(state => ({
            ...state,
            posts
        }));
    },
}));

// Allow inspecting via react devtools
// https://github.com/beerose/simple-zustand-devtools
if (process.env.NODE_ENV === 'development') {
    mountStoreDevtool('Store', usePostStore);
}

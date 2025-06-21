import apiClient, { ApiOptions } from '@/client/utils/apiClient';
import {
  GetBookmarksRequest,
  GetBookmarksResponse,
  AddVideoBookmarkRequest,
  AddVideoBookmarkResponse,
  RemoveVideoBookmarkRequest,
  RemoveVideoBookmarkResponse,
  AddChannelBookmarkRequest,
  AddChannelBookmarkResponse,
  RemoveChannelBookmarkRequest,
  RemoveChannelBookmarkResponse
} from './types';
import {
  GET_BOOKMARKS,
  ADD_VIDEO_BOOKMARK,
  REMOVE_VIDEO_BOOKMARK,
  ADD_CHANNEL_BOOKMARK,
  REMOVE_CHANNEL_BOOKMARK
} from './index';

export const getBookmarks = (params: GetBookmarksRequest = {}, options?: ApiOptions) => {
  return apiClient.call<GetBookmarksResponse, GetBookmarksRequest>(GET_BOOKMARKS, params, options);
};

export const addVideoBookmark = (params: AddVideoBookmarkRequest, options?: ApiOptions) => {
  return apiClient.call<AddVideoBookmarkResponse, AddVideoBookmarkRequest>(ADD_VIDEO_BOOKMARK, params, options);
};

export const removeVideoBookmark = (params: RemoveVideoBookmarkRequest, options?: ApiOptions) => {
  return apiClient.call<RemoveVideoBookmarkResponse, RemoveVideoBookmarkRequest>(REMOVE_VIDEO_BOOKMARK, params, options);
};

export const addChannelBookmark = (params: AddChannelBookmarkRequest, options?: ApiOptions) => {
  return apiClient.call<AddChannelBookmarkResponse, AddChannelBookmarkRequest>(ADD_CHANNEL_BOOKMARK, params, options);
};

export const removeChannelBookmark = (params: RemoveChannelBookmarkRequest, options?: ApiOptions) => {
  return apiClient.call<RemoveChannelBookmarkResponse, RemoveChannelBookmarkRequest>(REMOVE_CHANNEL_BOOKMARK, params, options);
}; 
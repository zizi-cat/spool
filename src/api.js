import { getToken, getUser, isAuthenticated } from './config.js';

const GRAPH_API_BASE = 'https://graph.threads.net/v1.0';

class ThreadsAPIError extends Error {
  constructor(message, code, response) {
    super(message);
    this.name = 'ThreadsAPIError';
    this.code = code;
    this.response = response;
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    throw new ThreadsAPIError('Not authenticated. Run: spool login', 'AUTH_REQUIRED');
  }

  const url = new URL(`${GRAPH_API_BASE}${endpoint}`);
  
  // Add access token to query params
  url.searchParams.set('access_token', token);
  
  // Add any additional query params
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }
  }

  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url.toString(), fetchOptions);
  const data = await response.json();

  if (!response.ok || data.error) {
    const error = data.error || {};
    throw new ThreadsAPIError(
      error.message || 'API request failed',
      error.code || response.status,
      data
    );
  }

  return data;
}

// User endpoints
export async function getMe() {
  return request('/me', {
    params: {
      fields: 'id,username,name,threads_profile_picture_url,threads_biography'
    }
  });
}

export async function getUserProfile(userId) {
  return request(`/${userId}`, {
    params: {
      fields: 'id,username,name,threads_profile_picture_url,threads_biography'
    }
  });
}

// Post endpoints
export async function createTextPost(text, options = {}) {
  const user = getUser();
  if (!user.id) {
    throw new ThreadsAPIError('User ID not found. Run: spool login', 'USER_ID_REQUIRED');
  }

  // Step 1: Create media container
  const containerParams = {
    media_type: 'TEXT',
    text: text,
  };

  if (options.replyTo) {
    containerParams.reply_to_id = options.replyTo;
  }

  const container = await request(`/${user.id}/threads`, {
    method: 'POST',
    params: containerParams,
  });

  // Step 2: Publish the container
  const published = await request(`/${user.id}/threads_publish`, {
    method: 'POST',
    params: {
      creation_id: container.id,
    },
  });

  return published;
}

export async function createImagePost(text, imageUrl) {
  const user = getUser();
  if (!user.id) {
    throw new ThreadsAPIError('User ID not found. Run: spool login', 'USER_ID_REQUIRED');
  }

  // Step 1: Create media container with image
  const container = await request(`/${user.id}/threads`, {
    method: 'POST',
    params: {
      media_type: 'IMAGE',
      image_url: imageUrl,
      text: text,
    },
  });

  // Step 2: Publish
  const published = await request(`/${user.id}/threads_publish`, {
    method: 'POST',
    params: {
      creation_id: container.id,
    },
  });

  return published;
}

export async function getPost(postId) {
  return request(`/${postId}`, {
    params: {
      fields: 'id,text,username,timestamp,media_type,media_url,permalink,is_reply,has_replies,reply_audience'
    }
  });
}

export async function getUserPosts(limit = 10) {
  const user = getUser();
  if (!user.id) {
    throw new ThreadsAPIError('User ID not found. Run: spool login', 'USER_ID_REQUIRED');
  }

  return request(`/${user.id}/threads`, {
    params: {
      fields: 'id,text,timestamp,media_type,permalink,is_reply',
      limit: limit,
    }
  });
}

export async function getReplies(postId, limit = 25) {
  return request(`/${postId}/replies`, {
    params: {
      fields: 'id,text,username,timestamp,permalink',
      limit: limit,
    }
  });
}

// Search
export async function searchPosts(query, options = {}) {
  return request('/threads/search', {
    params: {
      q: query,
      fields: 'id,text,username,timestamp,permalink',
      limit: options.limit || 10,
      search_type: options.tag ? 'tag' : 'keyword',
    }
  });
}

// Delete
export async function deletePost(postId) {
  return request(`/${postId}`, {
    method: 'DELETE',
  });
}

export { ThreadsAPIError };

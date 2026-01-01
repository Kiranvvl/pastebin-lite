// import { nanoid } from 'nanoid';
// import { pool } from '@/lib/db';
// import { validatePasteInput } from '@/lib/validation';

// export async function POST(request) {
//   try {
//     const data = await request.json();
//     const errors = validatePasteInput(data);
    
//     if (errors.length > 0) {
//       return Response.json(
//         { error: errors[0] },
//         { status: 400 }
//       );
//     }

//     const { content, ttl_seconds, max_views } = data;
//     const id = nanoid(8);
//     const now = new Date();
//     const expiresAt = ttl_seconds 
//       ? new Date(now.getTime() + ttl_seconds * 1000)
//       : null;

//     await pool.query(
//       `INSERT INTO pastes (id, content, created_at, expires_at, max_views, views_used)
//        VALUES ($1, $2, $3, $4, $5, 0)`,
//       [id, content.trim(), now, expiresAt, max_views || null]
//     );

//     const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    
//     return Response.json({
//       id,
//       url: `${appUrl}/p/${id}`
//     }, { status: 201 });

//   } catch (err) {
//     console.error('Error creating paste:', err);
//     return Response.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }


// app/api/pastes/route.js
import { nanoid } from 'nanoid';
import { pool } from '../../../lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validation
    if (!data.content || typeof data.content !== 'string' || !data.content.trim()) {
      return Response.json(
        { error: 'content is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    const id = nanoid(8);
    const now = new Date();
    const expiresAt = data.ttl_seconds 
      ? new Date(now.getTime() + data.ttl_seconds * 1000)
      : null;

    await pool.query(
      `INSERT INTO pastes (id, content, created_at, expires_at, max_views, views_used)
       VALUES ($1, $2, $3, $4, $5, 0)`,
      [id, data.content.trim(), now, expiresAt, data.max_views || null]
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    return Response.json({
      id,
      url: `${appUrl}/p/${id}`
    }, { status: 201 });

  } catch (err) {
    console.error('Error creating paste:', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { translate } from 'google-translate-api-x';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        // Handle array of strings or single string
        const textsToTranslate = Array.isArray(text) ? text : [text];

        // Translate all texts
        const results = await Promise.all(
            textsToTranslate.map(async (t) => {
                try {
                    // Using auto detection for source, target is 'vi' (Vietnamese)
                    const res = await translate(t, { to: 'vi' }) as any;
                    return res.text;
                } catch (e) {
                    console.error(`Translation failed for text: ${t}`, e);
                    return t; // Return original on failure
                }
            })
        );

        return NextResponse.json({
            translated: Array.isArray(text) ? results : results[0]
        });

    } catch (error) {
        console.error('Translation API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

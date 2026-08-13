export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { databaseId, data } = req.body;
    const notionToken = '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';
    
    if (!notionToken || !databaseId) {
        return res.status(500).json({ error: 'Missing Notion credentials' });
    }
    
    try {
        // Determinar qué tipo de dato es (Proyecto o Instalador)
        const isInstaller = data.pin ? true : false;
        
        const payload = {
            parent: { database_id: databaseId },
            properties: {
                'Nombre': {
                    title: [
                        {
                            text: {
                                content: data.nombre
                            }
                        }
                    ]
                }
            }
        };
        
        // Si es instalador, agrega el PIN
        if (isInstaller) {
            payload.properties['PIN'] = {
                rich_text: [
                    {
                        text: {
                            content: data.pin
                        }
                    }
                ]
            };
        }
        
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Notion API error:', error);
            return res.status(response.status).json({ error: error });
        }
        
        const result = await response.json();
        
        return res.status(200).json({ 
            success: true,
            pageId: result.id,
            message: 'Dato agregado a Notion'
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

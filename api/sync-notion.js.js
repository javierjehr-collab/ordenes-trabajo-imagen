export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { order } = req.body;
    const notionToken = process.env.NOTION_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!notionToken || !databaseId) {
        return res.status(500).json({ error: 'Missing Notion credentials' });
    }
    
    try {
        // Create page in Notion database
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                parent: { database_id: databaseId },
                properties: {
                    'Título': {
                        title: [
                            {
                                text: {
                                    content: `${order.workType} - ${order.project}`
                                }
                            }
                        ]
                    },
                    'Instalador': {
                        rich_text: [
                            {
                                text: {
                                    content: order.installer
                                }
                            }
                        ]
                    },
                    'Proyecto': {
                        rich_text: [
                            {
                                text: {
                                    content: order.project
                                }
                            }
                        ]
                    },
                    'Tipo de Trabajo': {
                        select: {
                            name: order.workType
                        }
                    },
                    'Descripción': {
                        rich_text: [
                            {
                                text: {
                                    content: order.description
                                }
                            }
                        ]
                    },
                    'Cliente': {
                        rich_text: [
                            {
                                text: {
                                    content: order.clientName
                                }
                            }
                        ]
                    },
                    'Fecha': {
                        date: {
                            start: order.timestamp.split('T')[0]
                        }
                    },
                    'Estado': {
                        select: {
                            name: 'Pendiente de Revisar'
                        }
                    }
                }
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Notion API error:', error);
            return res.status(response.status).json({ error: error });
        }
        
        const data = await response.json();
        
        // Note: Las imágenes (fotos antes/después/selfie y firma) se deben subir
        // manualmente a Notion o mediante un servicio de almacenamiento externo
        // Esta es una limitación de la API de Notion - no acepta base64 directo
        
        return res.status(200).json({ 
            success: true, 
            pageId: data.id,
            message: 'Orden sincronizada con Notion. Las fotos se pueden adjuntar manualmente desde la base de datos.'
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

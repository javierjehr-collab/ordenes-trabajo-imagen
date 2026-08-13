export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { databaseId } = req.body;
    const notionToken = process.env.NOTION_TOKEN;
    
    if (!notionToken || !databaseId) {
        return res.status(500).json({ error: 'Missing Notion credentials' });
    }
    
    try {
        const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                page_size: 100
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Notion API error:', error);
            return res.status(response.status).json({ error: error });
        }
        
        const data = await response.json();
        const results = data.results.map(page => {
            const props = page.properties;
            
            // Detectar si es Proyectos o Instaladores por las propiedades
            if (props.Nombre) {
                // Puede ser ambos
                return {
                    id: page.id,
                    nombre: props.Nombre?.title?.[0]?.plain_text || '',
                    pin: props.PIN?.rich_text?.[0]?.plain_text || ''
                };
            }
            
            return null;
        }).filter(Boolean);
        
        return res.status(200).json({ 
            success: true,
            data: results
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

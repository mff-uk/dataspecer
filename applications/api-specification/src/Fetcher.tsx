import useSWR from 'swr';

export async function fetchDataSpecificationInfo() 
{
    const fetcher = async (url: string) => 
    {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Response - not OK');
        }
        return response.json();
    };

    const { data, error } = useSWR('https://backend.dataspecer.com/resources/packages?iri=https%3A%2F%2Fofn.gov.cz%2Fdata-specification%2F26bfd105-3d19-4664-ad8b-d6f84131d099', fetcher);

    if (error) 
    {
        console.error("Info about Data Specification could not be fetched: ", error);
        return;
    }

    // Get iris of Data Structures
    const dsIris = data?.subResources?.filter((resource: { types: string | string[]; }) => resource.types.includes("http://dataspecer.com/resources/v1/psm"))
                                      .map((resource: { iri: any; }) => resource.iri);

    // Get Data Structures corresponding to their iris
    const fetchPromises = dsIris.map(iri =>
        fetch("https://backend.dataspecer.com/resources/blob?iri=" + iri)
            .then(response => response.json())
            .catch(error => {
                console.error(`Info about Data Structure with ${iri}: could not be fetched. Error: `, error);
                return null; 
            })
    );

    try 
    {
        const dataStructArr = await Promise.all(fetchPromises);
        const validData = dataStructArr.filter(data => data !== null);
        return validData;
    } 
    catch (error) 
    {
        console.error("Error fetching data:", error);
        return null;
    }
}



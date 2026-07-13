import { useNavigate, useSearchParams } from "react-router";
import ComponentBuilderPlayground from "../../../components/htmlbuilder/Builder/ComponentBuilderPlayground";
import { useGetHtmlComponentByIdQuery } from "../../../redux/htmlbuilder/htmlBuilderAPI";


const ComponentBuilderPage = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const navigate = useNavigate();

    const { data: componentData, isLoading } = useGetHtmlComponentByIdQuery(Number(id), {
        skip: !id,
    });

    const handleBack = () => {
        navigate("/admin/componentbuilder");
    };

    if (id && isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <ComponentBuilderPlayground
            onBack={handleBack}
            initialData={componentData?.Data}
        />

    );
};

export default ComponentBuilderPage;

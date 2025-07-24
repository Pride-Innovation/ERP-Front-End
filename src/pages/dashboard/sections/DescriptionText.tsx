import { Link, Typography } from "@mui/material";
import { useState } from "react";

const DescriptionText: React.FC<{ description: string, MAX_LENGTH: number }> = ({
    description, MAX_LENGTH = 190 }) => {
    const [expanded, setExpanded] = useState(false);

    const isLongText = description.length > MAX_LENGTH;
    const displayText = expanded || !isLongText
        ? description
        : `${description.slice(0, MAX_LENGTH)}...`;

    const toggleExpanded = () => setExpanded(prev => !prev);

    return (
        <Typography mt={1.5} fontSize={14} color="text.secondary">
            {displayText}
            {isLongText && (
                <>
                    &nbsp;
                    <Link
                        component="button"
                        variant="body2"
                        onClick={toggleExpanded}
                        sx={{ color: 'primary.main', textDecoration: 'none', cursor: 'pointer' }}
                    >
                        {expanded ? 'View less' : 'View more'}
                    </Link>
                </>
            )}
        </Typography>
    );
}

export default DescriptionText;
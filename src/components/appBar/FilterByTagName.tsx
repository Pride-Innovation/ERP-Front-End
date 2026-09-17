import { Box } from "@mui/material"
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import React from "react";
import { toast } from "react-toastify";
import { findAssetByTagNameService } from "./service";
import { refusal } from "../../core/apis/globalService";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../core/routes/routes";

const FilterByTagName = () => {
    const [searchText, setSearchText] = React.useState<string>("");
    /** Disables the button while a search is in flight, so a slow lookup cannot be queued twice. */
    const [searching, setSearching] = React.useState<boolean>(false);
    const navigate = useNavigate();

    const handleSearch = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!searchText.trim()) {
            toast.error("Please enter a tag name to search.");
            return;
        }
        /*
         * Four outcomes, and the old code had a branch for exactly one of them.
         *
         * It read `if (result && result.id) navigate(...)` and did nothing otherwise — and because
         * the service swallowed its own failures into a returned value, "otherwise" covered *every*
         * case but a successful single hit. A tag that did not exist, a tag belonging to another
         * branch, a server error: all of them left the user looking at a search box that had visibly
         * accepted the click and then done nothing.
         */
        /*
         * A guard of its own, not just a disabled button.
         *
         * The button carries `disabled={searching}`, which covers the click — and the input has an
         * `onKeyDown` handler for Enter, which it does not. So holding or double-tapping Enter ran
         * the whole search again while the first was still in flight.
         *
         * (The other thing that reads as a double call in the network panel is the **CORS preflight**:
         * the dev server is :3000 and the API is :7777, and the `Authorization` header is not
         * CORS-safelisted, so every request is an OPTIONS followed by the GET. That pair disappears
         * the moment the two are served from one origin — see the firewall notes in CLAUDE.md.)
         */
        if (searching) return;

        setSearching(true);
        try {
            const match = await findAssetByTagNameService(searchText.trim());

            if (!match) {
                /*
                 * Deliberately one message for two situations. The server omits matches outside the
                 * caller's branch rather than refusing them, so "no such tag" and "not yours" arrive
                 * identically — and must stay that way, or the search would confirm that a tag exists
                 * somewhere the user may not look.
                 */
                toast.info(`No asset in your branch carries the tag "${searchText.trim()}".`);
                return;
            }

            /*
             * Both segments, because the detail route is
             * `/assets/general/:typeId/view/:id` — and this is what the 404 was.
             *
             * The old code navigated to `${ROUTES.LIST_ASSETS}/${id}`, which matches no route at all.
             * It had always been wrong and was never reached, because the search silently did nothing
             * on every path; fixing the search walked straight into the broken destination behind it.
             *
             * A match with no category cannot build a URL, so it says so rather than navigating
             * somewhere that will 404 again.
             */
            if (match.assetTypeId == null) {
                toast.warning(
                    `"${match.engravedNumber ?? searchText.trim()}" is not filed under a category, `
                    + `so its record cannot be opened from here.`,
                );
                return;
            }

            navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${match.assetTypeId}/view/${match.id}`);
        } catch (error) {
            toast.error(refusal(error, "Could not search for that tag. Please try again."));
        } finally {
            setSearching(false);
        }
    };

    return (
        <Box>
            <Paper
                component="form"
                elevation={0}
                sx={{
                    p: '4px 6px 4px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    width: { xs: 200, sm: 280, md: 340 },
                    bgcolor: 'grey.50',
                    border: 1,
                    borderColor: 'border.subtle',
                    borderRadius: '50px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor: 'grey.100',
                        borderColor: 'border.default',
                    },
                    '&:focus-within': {
                        bgcolor: 'background.paper',
                        borderColor: 'primary.main',
                        boxShadow: (theme) => `0 0 0 3px ${theme.palette.brand[100]}`,
                    },
                }}
            >
                <InputBase
                    sx={{
                        ml: 0.5,
                        flex: 1,
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        '& input::placeholder': {
                            color: 'text.secondary',
                            opacity: 1,
                        },
                    }}
                    placeholder="Search by tag name..."
                    inputProps={{ 'aria-label': 'search asset by tag name' }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(e as unknown as React.MouseEvent<HTMLButtonElement>);
                        }
                    }}
                />
                <IconButton
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSearch(e)}
                    type="button"
                    size="small"
                    disabled={searching}
                    sx={{
                        p: '6px',
                        bgcolor: 'primary.main',
                        color: '#fff',
                        borderRadius: '50%',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                            color: '#fff',
                        },
                    }}
                    aria-label="search"
                >
                    <SearchIcon fontSize="small" />
                </IconButton>
            </Paper>
        </Box>
    );
};

export default FilterByTagName;